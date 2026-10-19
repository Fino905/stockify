<?php

namespace App\Repositories\Eloquent;

use App\Models\ProductAttribute;
use App\Repositories\Contracts\ProductAttributeRepositoryInterface;

class ProductAttributeRepository implements ProductAttributeRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): ProductAttribute
    {
        return ProductAttribute::create($data);
    }

    public function delete(ProductAttribute $attribute): bool
    {
        return (bool) $attribute->delete();
    }
}
