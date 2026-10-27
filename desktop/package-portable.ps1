param(
  [Parameter(Mandatory = $true)]
  [string]$Prepackaged,
  [Parameter(Mandatory = $true)]
  [string]$Output
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$builder = Join-Path $projectRoot 'node_modules\.bin\electron-builder.cmd'
& $builder --prepackaged $Prepackaged --win portable --publish never "--config.directories.output=$Output"
exit $LASTEXITCODE
