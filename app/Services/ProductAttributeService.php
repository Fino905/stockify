<?php

namespace App\Services;

use App\Models\ProductAttribute;
use App\Repositories\Contracts\ProductAttributeRepositoryInterface;

class ProductAttributeService
{
    public function __construct(
        protected ProductAttributeRepositoryInterface $attributeRepository
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function addAttribute(array $data): ProductAttribute
    {
        return $this->attributeRepository->create($data);
    }

    public function deleteAttribute(ProductAttribute $attribute): bool
    {
        return $this->attributeRepository->delete($attribute);
    }
}
