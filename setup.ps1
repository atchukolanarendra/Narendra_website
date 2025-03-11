Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NEXT_PRIVATE_SKIP_SETUP = "1"

# Remove existing files if they exist
if (Test-Path "index.html") { Remove-Item "index.html" }
if (Test-Path "script.js") { Remove-Item "script.js" }
if (Test-Path "styles.css") { Remove-Item "styles.css" }

# Create Next.js app with predefined answers
$process = Start-Process -FilePath "npx" -ArgumentList @(
    "create-next-app@latest",
    ".",
    "--typescript",
    "--tailwind",
    "--eslint",
    "--app",
    "--src-dir",
    "--import-alias", "@/*",
    "--use-npm",
    "--no-tailwind",
    "--no-eslint",
    "--no-src-dir",
    "--no-experimental-app"
) -NoNewWindow -PassThru -Wait

if ($process.ExitCode -eq 0) {
    Write-Host "Next.js project created successfully!"
} else {
    Write-Host "Failed to create Next.js project."
} 