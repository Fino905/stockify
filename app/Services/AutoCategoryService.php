<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

class AutoCategoryService
{
    protected string $mlApiUrl = 'http://127.0.0.1:5000/api/classify';

    /**
     * Menyarankan kategori berdasarkan foto dan/atau nama produk.
     *
     * @return array{category_id: int|null, category_name: string|null, score: float, source: string}
     */
    /**
     * Menyarankan kategori berdasarkan foto dan/atau nama produk.
     *
     * @return array{category_id: int|null, category_name: string|null, score: float, source: string}
     */
    public function suggestCategory(?string $itemName = null, mixed $image = null): array
    {
        $resolved = $this->resolveImageSource($image);

        // Ekstrak nama file gambar jika ada sebagai petunjuk teks tambahan
        $imageFilename = '';
        if (! empty($resolved['filename'])) {
            $rawName = pathinfo($resolved['filename'], PATHINFO_FILENAME);
            $cleanName = trim(str_replace(['-', '_', '.', '+'], ' ', $rawName));
            if (! is_numeric($cleanName) && strlen($cleanName) >= 3) {
                $imageFilename = $cleanName;
            }
        }

        // Gabungkan nama produk dan nama file sebagai multimodal text hint
        $textHint = trim(($itemName ?? '').' '.$imageFilename);

        // 1. Jika nama produk atau nama file mengandung kata kunci yang jelas (>= 70%), utamakan teks!
        if ($textHint !== '') {
            $textResult = $this->suggestFromText($textHint);
            if ($textResult && ($textResult['score'] ?? 0) >= 70.0) {
                if ($resolved['isTemp'] && ! empty($resolved['filePath']) && file_exists($resolved['filePath'])) {
                    @unlink($resolved['filePath']);
                }

                return $this->formatWithThreeOptions($textResult);
            }
        }

        // 2. Coba klasifikasi via ML Vision jika gambar disediakan (dengan menyertakan text hint)
        if (! empty($resolved['filePath'])) {
            $mlResult = $this->classifyViaMlVisionResolved($resolved, $textHint);
            if ($mlResult && ! empty($mlResult['category_id'])) {
                return $this->formatWithThreeOptions($mlResult);
            }
        }

        // 3. Fallback cerdas berbasis kata kunci teks nama produk
        if ($textHint !== '') {
            $textResult = $this->suggestFromText($textHint);
            if ($textResult && ! empty($textResult['category_id'])) {
                return $this->formatWithThreeOptions($textResult);
            }
        }

        // 4. Fallback default ke kategori pertama di database jika ada
        $firstCategory = Category::first();

        return $this->formatWithThreeOptions([
            'category_id' => $firstCategory?->id,
            'category_name' => $firstCategory?->name ?? 'Umum',
            'score' => 50.0,
            'source' => 'default',
        ]);
    }

    /**
     * Menyelesaikan sumber gambar (UploadedFile, local path, relative path, atau web URL)
     * menjadi file lokal yang valid dan buffer konten.
     *
     * @return array{filePath: ?string, content: ?string, filename: string, isTemp: bool}
     */
    public function resolveImageSource(mixed $image): array
    {
        if ($image instanceof UploadedFile) {
            return [
                'filePath' => $image->getRealPath(),
                'content' => @file_get_contents($image->getRealPath()) ?: null,
                'filename' => $image->getClientOriginalName(),
                'isTemp' => false,
            ];
        }

        if (! is_string($image) || trim($image) === '') {
            return ['filePath' => null, 'content' => null, 'filename' => '', 'isTemp' => false];
        }

        $image = trim($image);

        // 1. Data URI (Base64)
        if (str_starts_with($image, 'data:image')) {
            $parts = explode(',', $image, 2);
            if (isset($parts[1])) {
                $content = base64_decode($parts[1]);
                $temp = tempnam(sys_get_temp_dir(), 'stk_');
                file_put_contents($temp, $content);

                return ['filePath' => $temp, 'content' => $content, 'filename' => 'upload.jpg', 'isTemp' => true];
            }
        }

        // 2. Direct absolute file path on disk (Hanya izinkan file di dalam direktori publik atau storage aplikasi)
        $realPath = realpath($image);
        $allowedStorage = realpath(storage_path('app/public'));
        $allowedPublic = realpath(public_path());
        if ($realPath && is_file($realPath)) {
            $isAllowed = ($allowedStorage && str_starts_with($realPath, $allowedStorage)) ||
                         ($allowedPublic && str_starts_with($realPath, $allowedPublic));
            if ($isAllowed) {
                return [
                    'filePath' => $realPath,
                    'content' => @file_get_contents($realPath) ?: null,
                    'filename' => basename($realPath),
                    'isTemp' => false,
                ];
            }
        }

        // 3. Local relative storage/public path
        $cleanPath = ltrim(preg_replace('#^https?://[^/]+#i', '', $image), '/');

        // Cek path storage (/storage/products/...)
        if (str_starts_with($cleanPath, 'storage/')) {
            $subPath = substr($cleanPath, 8);
            $localDiskPath = storage_path('app/public/'.$subPath);
            if (file_exists($localDiskPath) && is_file($localDiskPath)) {
                return [
                    'filePath' => $localDiskPath,
                    'content' => @file_get_contents($localDiskPath) ?: null,
                    'filename' => basename($localDiskPath),
                    'isTemp' => false,
                ];
            }
        }

        // Cek path public
        $publicDiskPath = public_path($cleanPath);
        if (file_exists($publicDiskPath) && is_file($publicDiskPath)) {
            return [
                'filePath' => $publicDiskPath,
                'content' => @file_get_contents($publicDiskPath) ?: null,
                'filename' => basename($publicDiskPath),
                'isTemp' => false,
            ];
        }

        // 4. Remote HTTP/HTTPS URL (Proteksi SSRF: Larang loopback dan alamat IP privat)
        if (filter_var($image, FILTER_VALIDATE_URL) && (str_starts_with($image, 'http://') || str_starts_with($image, 'https://'))) {
            try {
                $host = parse_url($image, PHP_URL_HOST);
                if ($host) {
                    $ip = gethostbyname($host);
                    // Tolak jika IP merupakan private network, loopback, atau reserved (SSRF Protection)
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                        Log::warning('Percobaan SSRF dicegah untuk host: '.$host.' (IP: '.$ip.')');
                        return ['filePath' => null, 'content' => null, 'filename' => '', 'isTemp' => false];
                    }
                }

                $response = Http::timeout(8)
                    ->withHeaders([
                        'User-Agent' => 'Stockify-Bot/1.0',
                    ])
                    ->get($image);

                if ($response->successful()) {
                    $contentType = $response->header('Content-Type') ?? '';
                    if (str_contains($contentType, 'image/') || empty($contentType)) {
                        $content = $response->body();
                        $urlPath = parse_url($image, PHP_URL_PATH) ?? '';
                        $fname = basename($urlPath) ?: 'remote_image.jpg';
                        $temp = tempnam(sys_get_temp_dir(), 'stk_');
                        file_put_contents($temp, $content);

                        return ['filePath' => $temp, 'content' => $content, 'filename' => $fname, 'isTemp' => true];
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Gagal download gambar dari URL '.$image.': '.$e->getMessage());
            }
        }

        return ['filePath' => null, 'content' => null, 'filename' => '', 'isTemp' => false];
    }

    /**
     * Memanggil microservice Flask Python (/api/classify) atau fallback ke Python CLI langsung
     *
     * @param  array{filePath: ?string, content: ?string, filename: string, isTemp: bool}  $resolved
     * @return array{category_id: int, category_name: string, score: float, source: string, matched_sample?: string|null}|null
     */
    protected function classifyViaMlVisionResolved(array $resolved, string $textHint = ''): ?array
    {
        $filePath = $resolved['filePath'];
        if (! $filePath || ! file_exists($filePath)) {
            return null;
        }

        // 1. Coba lewat Flask microservice jika aktif
        try {
            $request = Http::timeout(4);
            $content = $resolved['content'] ?: @file_get_contents($filePath);
            if ($content) {
                $response = $request->attach(
                    'image',
                    $content,
                    $resolved['filename'] ?: 'photo.jpg'
                )->post($this->mlApiUrl, ['name' => $textHint]);

                if ($response && $response->successful()) {
                    $data = $response->json();
                    if (! empty($data['success']) && ! empty($data['data'])) {
                        $res = $data['data'];
                        $catName = $res['category'] ?? '';

                        $category = null;
                        if (! empty($catName)) {
                            $category = Category::where('name', $catName)
                                ->orWhere('name', 'like', '%'.$catName.'%')
                                ->first();
                        }

                        if (! $category && ! empty($res['category_id'])) {
                            $category = Category::find($res['category_id']);
                        }

                        if ($category) {
                            if ($resolved['isTemp'] && file_exists($filePath)) {
                                @unlink($filePath);
                            }

                            return [
                                'category_id' => $category->id,
                                'category_name' => $category->name,
                                'score' => (float) ($res['score'] ?? 80.0),
                                'source' => 'ml_vision',
                                'matched_sample' => $res['matched_sample'] ?? null,
                            ];
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::info('ML Flask Microservice not responding, falling back to Python CLI: '.$e->getMessage());
        }

        // 2. Fallback: Eksekusi Category Engine via Python CLI secara langsung
        return $this->classifyViaPythonCliResolved($resolved, $textHint);
    }

    /**
     * Menjalankan category_engine.py langsung via Python venv
     *
     * @param  array{filePath: ?string, content: ?string, filename: string, isTemp: bool}  $resolved
     * @return array{category_id: int, category_name: string, score: float, source: string, matched_sample?: string|null}|null
     */
    protected function classifyViaPythonCliResolved(array $resolved, string $textHint = ''): ?array
    {
        $filePath = $resolved['filePath'];
        if (! $filePath || ! file_exists($filePath)) {
            return null;
        }

        try {
            $basePython = base_path('../python/auto-category-gudang/.venv/Scripts/python.exe');
            $pythonPath = realpath($basePython) ?: $basePython;

            $baseEngineDir = base_path('../python/auto-category-gudang');
            $engineDir = realpath($baseEngineDir) ?: $baseEngineDir;

            if (! file_exists($pythonPath)) {
                return null;
            }

            $pythonCode = <<<'PY'
import sys, json
sys.path.append(sys.argv[1])
try:
    from category_engine import classify_image
    from PIL import Image
    hint = sys.argv[3] if len(sys.argv) > 3 else ""
    with Image.open(sys.argv[2]) as img:
        res = classify_image(img, text_hint=hint)
        print(json.dumps(res))
except Exception as e:
    print(json.dumps({"error": str(e)}))
PY;

            $process = new Process([$pythonPath, '-c', $pythonCode, $engineDir, $filePath, $textHint]);
            $process->setTimeout(25);
            $process->run();

            if ($resolved['isTemp'] && file_exists($filePath)) {
                @unlink($filePath);
            }

            if ($process->isSuccessful()) {
                $output = trim($process->getOutput());
                $data = json_decode($output, true);
                if (! empty($data['category'])) {
                    $catName = (string) $data['category'];

                    // Selalu utamakan pencarian berdasarkan nama kategori di database
                    $category = Category::where('name', $catName)
                        ->orWhere('name', 'like', '%'.$catName.'%')
                        ->first();

                    if (! $category && ! empty($data['category_id'])) {
                        $category = Category::find($data['category_id']);
                    }

                    if ($category) {
                        $mappedOptions = [];
                        if (! empty($data['options']) && is_array($data['options'])) {
                            foreach ($data['options'] as $idx => $opt) {
                                $optName = $opt['category_name'] ?? $opt['category'] ?? '';
                                $optCat = Category::where('name', $optName)
                                    ->orWhere('name', 'like', '%'.$optName.'%')
                                    ->first();
                                if (! $optCat && ! empty($opt['category_id'])) {
                                    $optCat = Category::find($opt['category_id']);
                                }
                                if ($optCat) {
                                    $mappedOptions[] = [
                                        'category_id' => $optCat->id,
                                        'category_name' => $optCat->name,
                                        'score' => (float) ($opt['score'] ?? 75.0),
                                        'is_top' => $idx === 0,
                                    ];
                                }
                            }
                        }

                        return [
                            'category_id' => $category->id,
                            'category_name' => $category->name,
                            'score' => (float) ($data['score'] ?? 85.0),
                            'source' => $data['source'] ?? 'ml_vision',
                            'matched_sample' => $data['matched_sample'] ?? null,
                            'options' => $mappedOptions,
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Python CLI Auto-Category failed: '.$e->getMessage());
        } finally {
            if ($resolved['isTemp'] && file_exists($filePath)) {
                @unlink($filePath);
            }
        }

        return null;
    }

    /**
     * Sinkronisasikan seluruh kategori database ke file categories.json yang digunakan Machine Learning Python
     */
    public function syncCategoriesToMl(): void
    {
        try {
            $categories = Category::all()->map(function ($cat) {
                return [
                    'id' => (int) $cat->id,
                    'name' => (string) $cat->name,
                    'description' => (string) ($cat->description ?? ''),
                ];
            })->values()->all();

            $baseEngineDir = base_path('../python/auto-category-gudang');
            $engineDir = realpath($baseEngineDir) ?: $baseEngineDir;
            $catFile = $engineDir . DIRECTORY_SEPARATOR . 'categories.json';

            if (is_dir($engineDir)) {
                file_put_contents($catFile, json_encode($categories, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                Log::info("Sinkronisasi ML: Sukses menulis " . count($categories) . " kategori ke {$catFile}");
            }
        } catch (\Throwable $e) {
            Log::warning('Gagal sinkronisasi kategori ke file ML: ' . $e->getMessage());
        }
    }

    /**
     * Menyarankan kategori berdasarkan teks/nama barang (NLP / keyword matching dinamis)
     * Kategori baru yang ditambahkan langsung otomatis dikenali berdasarkan nama & deskripsinya.
     *
     * @param  Collection<int, Category>|null  $categories
     * @return array{category_id: int, category_name: string, score: float, source: string}|null
     */
    public function suggestFromText(string $itemName, ?Collection $categories = null): ?array
    {
        $itemName = Str::lower(trim($itemName));
        if ($itemName === '') {
            return null;
        }

        $categories = $categories ?? Category::all();

        $keywordMap = [
            'Kendaraan & Otomotif' => [
                'motor', 'sepeda motor', 'motorcycle', 'motorbike', 'scooter', 'skuter', 'moped', 'vespa',
                'mobil', 'car', 'automobile', 'truk', 'truck', 'pickup', 'sepeda', 'bicycle', 'kendaraan', 'vehicle',
                'ban', 'ban luar', 'ban dalam', 'ban motor', 'ban mobil', 'ban tubeless', 'tire', 'velg',
                'oli', 'oil', 'pelumas', 'oli mesin', 'oli samping', 'oli gear', 'oli gardan', 'oli transmisi', 'oli rem', 'oli sintetis',
                'aki', 'accu', 'baterai motor', 'baterai mobil', 'aki kering', 'aki basah',
                'knalpot', 'exhaust', 'busi', 'spark plug', 'rem', 'brake', 'radiator', 'spion', 'shockbreaker',
                'shock', 'kampas', 'kampas rem', 'piston', 'karburator', 'injeksi', 'sparepart', 'onderdil', 'otomotif',
                'rantai roda', 'drive chain', 'bohlam motor', 'lampu motor', 'bohlam depan motor',
                'honda', 'yamaha', 'suzuki', 'kawasaki', 'toyota', 'daihatsu', 'mitsubishi',
                'beat', 'vario', 'scoopy', 'nmax', 'pcx', 'aerox', 'mio', 'supra', 'jupiter', 'satria', 'vixion', 'cbr', 'ninja', 'klx',
            ],
            'Peralatan & Perkakas' => [
                'peralatan', 'perkakas', 'tools', 'tool', 'alat', 'hardware',
                'obeng', 'screwdriver', 'tang', 'pliers', 'palu', 'martil', 'hammer',
                'kunci inggris', 'kunci pas', 'kunci ring', 'kunci sok', 'wrench', 'spanner',
                'mata bor', 'bor', 'drill', 'gergaji', 'saw', 'amplas', 'meteran', 'solder', 'gerinda', 'mesin gerinda', 'mesin bor', 'mesin potong', 'mesin las',
            ],
            'Perkakas & Baut' => [
                'baut', 'bolt', 'mur', 'nut', 'sekrup', 'screw', 'fastener', 'paku', 'dynabolt', 'rivet',
            ],
            'Sayur & Bahan Pangan' => [
                'sayur', 'sayuran', 'sayur mayur', 'vegetable', 'vegetables', 'fresh produce',
                'wortel', 'wortel segar', 'wortel lokal', 'wortel import', 'sayur wortel', 'carrot',
                'tomat', 'tomat segar', 'tomato', 'cabai', 'cabe', 'chili', 'chilli', 'cabe rawit', 'pepper',
                'bayam', 'spinach', 'kangkung', 'sawi', 'kubis', 'kol', 'cabbage',
                'kentang', 'potato', 'bawang', 'onion', 'garlic', 'shallot', 'bawang bombay', 'bawang merah', 'bawang putih',
                'brokoli', 'broccoli', 'timun', 'mentimun', 'cucumber', 'terong', 'eggplant', 'buncis', 'selada', 'lettuce',
                'jagung', 'corn', 'singkong', 'ubi', 'daun bawang', 'seledri', 'rempah', 'bumbu dapur',
                'pangan', 'food', 'beras', 'rice', 'buah', 'fruit', 'telur', 'egg',
            ],
            'Elektronik & Kelistrikan' => [
                'elektronik', 'kelistrikan', 'listrik', 'electrical', 'electronic',
                'kabel', 'cable', 'wire', 'trafo', 'transformer', 'mcb', 'breaker', 'circuit breaker',
                'saklar', 'switch', 'panel', 'relay', 'konektor', 'colokan', 'stopkontak', 'socket',
                'lampu', 'led', 'lamp', 'bulb', 'adaptor', 'adapter', 'power supply', 'fuse', 'sekring',
            ],
            'Perlengkapan K3' => [
                'k3', 'safety', 'pelindung', 'protective', 'ppe',
                'helm', 'helmet', 'hard hat', 'rompi', 'vest', 'goggles', 'kacamata', 'kacamata safety',
                'sarung tangan', 'gloves', 'sepatu safety', 'safety boots', 'masker', 'respirator',
                'earmuff', 'earplug', 'harness', 'body harness', 'apar', 'fire extinguisher',
            ],
            'Bahan Baku & Material' => [
                'material', 'bahan baku', 'raw material',
                'besi', 'iron', 'baja', 'steel', 'plat', 'plate', 'sheet', 'pipa', 'pipe',
                'logam', 'metal', 'galvanis', 'galvanized', 'stainless', 'tembaga', 'copper',
                'aluminium', 'aluminum', 'kayu', 'wood', 'timber', 'balok', 'beam', 'h-beam', 'wire rod',
            ],
        ];

        $scores = [];
        $itemTokens = preg_split('/[\s,\.\-_+\/]+/', $itemName) ?: [];
        $itemTokens = array_filter(array_map('trim', $itemTokens));

        foreach ($categories as $category) {
            $catName = (string) $category->name;
            $catDesc = (string) ($category->description ?? '');
            $matches = 0;

            $cleanCatName = Str::lower(trim($catName));
            // 1. Kecocokan nama kategori utuh
            if (Str::contains($itemName, $cleanCatName)) {
                $matches += 10;
            }

            // 2. Tokenisasi nama kategori (setiap kata pada nama kategori)
            $catWords = preg_split('/[\s,\.\-_&+\/]+/', $cleanCatName) ?: [];
            foreach ($catWords as $cw) {
                $cw = trim($cw);
                if (strlen($cw) >= 3) {
                    if (in_array($cw, $itemTokens, true)) {
                        $matches += 6;
                    } elseif (Str::contains($itemName, $cw)) {
                        $matches += 3;
                    }
                }
            }

            // 3. Tokenisasi deskripsi kategori baru
            if ($catDesc !== '') {
                $descWords = preg_split('/[\s,\.\-_&+\/]+/', Str::lower($catDesc)) ?: [];
                foreach ($descWords as $dw) {
                    $dw = trim($dw);
                    if (strlen($dw) >= 3 && ! in_array($dw, ['dan', 'atau', 'yang', 'dari', 'untuk', 'pada'], true)) {
                        if (in_array($dw, $itemTokens, true)) {
                            $matches += 4;
                        } elseif (Str::contains($itemName, $dw)) {
                            $matches += 2;
                        }
                    }
                }
            }

            // 4. Cek kamus sinonim jika kategori ada di kamus bawaan
            if (isset($keywordMap[$catName])) {
                foreach ($keywordMap[$catName] as $keyword) {
                    $kw = Str::lower($keyword);
                    if (str_contains($kw, ' ')) {
                        if (Str::contains($itemName, $kw)) {
                            $matches += 4;
                        }
                    } else {
                        if (preg_match('/\b'.preg_quote($kw, '/').'\b/i', $itemName)) {
                            $matches += 4;
                        } elseif (strlen($kw) >= 4 && Str::contains($itemName, $kw)) {
                            $matches += 1;
                        }
                    }
                }
            }

            $scores[$category->id] = $matches;
        }

        arsort($scores);
        $topCatId = array_key_first($scores);
        $highestMatch = $scores[$topCatId] ?? 0;

        if ($highestMatch > 0) {
            $bestCategory = $categories->firstWhere('id', $topCatId);
            $confidence = min(98.5, 65.0 + ($highestMatch * 5.0));

            $topOptions = [];
            $rank = 0;
            foreach ($scores as $catId => $matchCount) {
                if ($rank >= 3) {
                    break;
                }
                $cat = $categories->firstWhere('id', $catId);
                if ($cat) {
                    $s = $rank === 0 ? $confidence : max(50.0, round($confidence - ($rank * 14.0), 1));
                    $topOptions[] = [
                        'category_id' => $cat->id,
                        'category_name' => $cat->name,
                        'score' => $s,
                        'is_top' => $rank === 0,
                    ];
                    $rank++;
                }
            }

            return [
                'category_id' => $bestCategory->id,
                'category_name' => $bestCategory->name,
                'score' => $confidence,
                'source' => 'text_keyword',
                'options' => $topOptions,
            ];
        }

        return null;
    }

    /**
     * Memastikan hasil rekomendasi selalu memuat tepat 3 opsi kategori terbaik
     *
     * @param  array{category_id: int|null, category_name: string|null, score: float, source: string, options?: array}  $result
     */
    public function formatWithThreeOptions(array $result): array
    {
        $options = $result['options'] ?? [];
        $existingIds = array_column($options, 'category_id');

        if (count($options) < 3) {
            $allCategories = Category::all();
            $baseScore = $result['score'] ?? 80.0;
            $decrement = 13.0;

            if (empty($options) && ! empty($result['category_id'])) {
                $options[] = [
                    'category_id' => $result['category_id'],
                    'category_name' => $result['category_name'] ?? 'Kategori',
                    'score' => round($baseScore, 1),
                    'is_top' => true,
                ];
                $existingIds[] = $result['category_id'];
            }

            foreach ($allCategories as $cat) {
                if (count($options) >= 3) {
                    break;
                }
                if (! in_array($cat->id, $existingIds)) {
                    $score = max(50.0, round($baseScore - (count($options) * $decrement), 1));
                    $options[] = [
                        'category_id' => $cat->id,
                        'category_name' => $cat->name,
                        'score' => $score,
                        'is_top' => count($options) === 0,
                    ];
                    $existingIds[] = $cat->id;
                }
            }
        }

        $result['options'] = array_slice($options, 0, 3);

        return $result;
    }
}
