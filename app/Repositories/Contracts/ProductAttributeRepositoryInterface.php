<?php

namespace App\Repositories\Contracts;

use App\Models\ProductAttribute;

interface ProductAttributeRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): ProductAttribute;

    public function delete(ProductAttribute $attribute): bool;
}
