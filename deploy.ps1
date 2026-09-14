#!/usr/bin/env pwsh
# Invoxa Deployment Script for Windows PowerShell
# This script deploys the Invoxa contract to BOT Chain Testnet

param(
    [switch]$SkipTests = $false,
    [switch]$SkipCompile = $false
)

function Write-Header {
    Write-Host "`n===============================================" -ForegroundColor Cyan
    Write-Host "Invoxa Contract Deployment Script" -ForegroundColor Cyan
    Write-Host "===============================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Step {
    param([string]$Message, [int]$Step, [int]$Total)
    Write-Host "[$Step/$Total] $Message..." -ForegroundColor Yellow
}

# Main script starts here
Write-Header

# Check if running from project root
if (-not (Test-Path "contracts\package.json")) {
    Write-Error "Please run this script from the Invoxa project root directory"
    Write-Host "Expected to find: contracts\package.json" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for required files
if (-not (Test-Path "contracts\.env")) {
    Write-Error "contracts\.env not found"
    Write-Host "Please create contracts\.env with your private key and RPC URLs" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Prerequisites check:" -ForegroundColor White
Write-Success "contracts\.env found`n"

# Navigate to contracts directory
Push-Location contracts

try {
    # Compile contracts
    if (-not $SkipCompile) {
        Write-Step "Compiling contracts" 1 3
        npm run compile
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Compilation failed"
            Read-Host "Press Enter to exit"
            exit 1
        }
        Write-Success "Compilation complete`n"
    }

    # Run tests
    if (-not $SkipTests) {
        Write-Step "Running tests" 2 3
        npm test
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Tests failed"
            Read-Host "Press Enter to exit"
            exit 1
        }
        Write-Success "Tests passed (7/7)`n"
    }

    # Deploy to testnet
    Write-Step "Deploying to BOT Chain Testnet (Chain 968)" 3 3
    npm run deploy:testnet
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Deployment failed"
        Write-Host "`nCommon issues:" -ForegroundColor Yellow
        Write-Host "  - Insufficient testnet tokens: Get from https://faucet.botchain.ai" -ForegroundColor Gray
        Write-Host "  - Invalid private key: Check contracts\.env" -ForegroundColor Gray
        Write-Host "  - Network issues: Verify RPC URL in contracts\.env" -ForegroundColor Gray
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host "`n===============================================" -ForegroundColor Cyan
    Write-Success "DEPLOYMENT COMPLETE" -ForegroundColor Green
    Write-Host "===============================================`n" -ForegroundColor Cyan

    # Check for deployment addresses file
    if (Test-Path "deployment-addresses.json") {
        Write-Host "Contract deployed!" -ForegroundColor Green
        Write-Host "Check deployment-addresses.json for contract address.`n" -ForegroundColor White
        
        # Try to read and display the address
        try {
            $addresses = Get-Content deployment-addresses.json | ConvertFrom-Json
            if ($addresses.testnet) {
                Write-Host "Testnet Address: $($addresses.testnet)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "Could not read deployment address" -ForegroundColor Yellow
        }
        
        Write-Host "`nNext steps:" -ForegroundColor White
        Write-Host "1. Copy the deployed contract address" -ForegroundColor Gray
        Write-Host "2. Update frontend\.env.local with NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET=0x..." -ForegroundColor Gray
        Write-Host "3. Run: cd ..\frontend && npm run dev" -ForegroundColor Gray
    }
}
finally {
    Pop-Location
}

Write-Host "`nPress Enter to exit" -ForegroundColor Gray
Read-Host | Out-Null
