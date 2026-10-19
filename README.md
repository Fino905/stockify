<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## Stockify

Stockify is a Laravel inventory application with role-specific workspaces for Admin, Manajer Gudang, and Staff Gudang. Admins manage products, categories, reusable product-attribute definitions, suppliers, accounts, access roles, and application settings. Managers create products, record stock movements, monitor balances, and perform stock counts. Warehouse staff record incoming and outgoing transactions, explicitly mark receipts as inspected or issues as prepared, then confirm the transaction; only confirmation changes the stock balance. Staff can also record stock counts that immediately adjust the stock balance. Admins and Managers can review stock, transaction, and user activity reports.

### Local development

1. Install PHP/Composer and Node.js dependencies with `composer install` and `npm install`.
2. Configure `.env` with your database connection, then run `php artisan migrate --seed`.
3. In one terminal run `npm run dev`; in another run `php artisan serve`.
4. Open the URL printed by Laravel (normally `http://127.0.0.1:8000`). Keep both commands running during development.
5. If using an uploaded application logo, run `php artisan storage:link` once.

The development seeder creates demo accounts: `admin@stockify.test` / `Admin123`, `manager@stockify.test` / `Manager1`, and `staff@stockify.test` / `Staff123`. Do not use these demo credentials in production. To keep Laravel Debugbar out of the page, set `DEBUGBAR_ENABLED=false` in `.env` and restart the Laravel server.

For production assets, run `npm run build`.

### Product CSV import and export

Only Admins can download the CSV template, import products, or export the product catalog. The import accepts up to 1,000 rows in UTF-8 CSV (maximum 2 MB). Required columns are `name`, `sku`, `category`, `supplier`, `purchase_price`, `selling_price`, and `minimum_stock`. Optional columns are `description`, `initial_stock` (defaults to zero), and `attributes`.

Category and supplier values must match existing names (case-insensitive). Attributes use `Name:Value;Name:Value`, for example `Color:Black;Size:M`. Prices use plain decimal numbers without currency symbols or thousands separators. Each valid row is imported independently; invalid rows are reported by CSV line number. A positive initial stock is recorded as a confirmed incoming stock transaction so the stock ledger remains auditable. Exported CSVs contain the same columns, with `initial_stock` populated from the current calculated balance.

Application workflows are organized through services and repositories: product management uses `ProductService`/`ProductRepository`, stock movements use `StockTransactionService`/`StockTransactionRepository`, dashboards and reports use dedicated query repositories, and category, supplier, user, settings, and activity persistence are likewise handled behind repositories.

The authenticated Stockify layout adapts the Flowbite Admin Dashboard shell (fixed top navigation, role-aware sidebar, and responsive content area); demo-only navigation and placeholder widgets from the template are not exposed as Stockify features. Flowbite is initialized from the JavaScript entry point used by this layout.

Role boundaries combine the "Role" responsibilities with the detailed workflows: Admin manages all application data and settings; Managers create products, record stock transactions, view reports, and perform stock counts; warehouse Staff record and confirm incoming/outgoing work, can create an unregistered product during receipt, and may record stock counts. Only Admins can edit or delete products, define reusable product attributes, manage users, import/export products, or change application settings. Managers and Staff choose from the definitions when entering product attributes.

Product images can be uploaded as JPG, PNG, or WebP files (up to 2 MB) and are stored on Laravel's public disk. Incoming stock receipts can select the supplier for that specific transaction; when none is selected, the product's assigned supplier is recorded.

The five sample products use demo images in `storage/app/public/products`. Run `php artisan storage:link` to make uploaded and bundled public-disk images available to the browser.

Admins can update the application name, short description, and logo from Settings. Admins and Managers can review activity reports, while Staff can access stock and transaction tasks.

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains over 2000 video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the Laravel [Patreon page](https://patreon.com/taylorotwell).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Cubet Techno Labs](https://cubettech.com)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[Many](https://www.many.co.uk)**
- **[Webdock, Fast VPS Hosting](https://www.webdock.io/en)**
- **[DevSquad](https://devsquad.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[OP.GG](https://op.gg)**
- **[WebReinvent](https://webreinvent.com/?utm_source=laravel&utm_medium=github&utm_campaign=patreon-sponsors)**
- **[Lendio](https://lendio.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
