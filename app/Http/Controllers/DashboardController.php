<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function __invoke(Request $request): Response
    {
        return Inertia::render('dashboard', $this->dashboardService->getDashboardData($request->user()));
    }
}