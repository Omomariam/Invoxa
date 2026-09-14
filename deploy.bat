@echo off
REM Invoxa Deployment Script for Windows PowerShell
REM This script deploys the Invoxa contract to BOT Chain Testnet

REM Check if running from project root
if not exist "contracts\package.json" (
    echo Error: Please run this script from the Invoxa project root directory
    echo Expected to find: contracts\package.json
    pause
    exit /b 1
)

echo.
echo ===============================================
echo Invoxa Contract Deployment Script
echo ===============================================
echo.

REM Check for required files
if not exist "contracts\.env" (
    echo Error: contracts\.env not found
    echo Please create contracts\.env with your private key and RPC URLs
    pause
    exit /b 1
)

echo Prerequisites check:
echo - contracts\.env: ✓ Found
echo.

REM Navigate to contracts directory
cd contracts

echo Starting deployment process...
echo.

REM Compile contracts
echo [1/3] Compiling contracts...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo Error: Compilation failed
    cd ..
    pause
    exit /b 1
)
echo Compilation: ✓ Success
echo.

REM Run tests
echo [2/3] Running tests...
call npm test
if %errorlevel% neq 0 (
    echo Error: Tests failed
    cd ..
    pause
    exit /b 1
)
echo Tests: ✓ Success (7/7 passing)
echo.

REM Deploy to testnet
echo [3/3] Deploying to BOT Chain Testnet (Chain 968)...
call npm run deploy:testnet

if %errorlevel% neq 0 (
    echo.
    echo Error: Deployment failed
    echo Common issues:
    echo   - Insufficient testnet tokens: Get from https://faucet.botchain.ai
    echo   - Invalid private key: Check contracts\.env
    echo   - Network issues: Verify RPC URL in contracts\.env
    cd ..
    pause
    exit /b 1
)

echo.
echo ===============================================
echo Deployment Status: ✓ SUCCESS
echo ===============================================
echo.

REM Read deployment address
if exist "deployment-addresses.json" (
    echo Contract deployed! Check deployment-addresses.json for address.
    echo.
    echo Next steps:
    echo 1. Copy the deployed contract address
    echo 2. Update frontend\.env.local with NEXT_PUBLIC_INVOICE_CONTRACT_TESTNET=0x...
    echo 3. Run: cd ../frontend ^&^& npm run dev
)

cd ..
pause
