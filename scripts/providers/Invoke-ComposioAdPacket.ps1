[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$PacketPath,
    [Parameter(Mandatory=$true)][ValidateSet('validate','createPaused','enable','readback')][string]$Phase,
    [string]$OutputPath
)
$ErrorActionPreference='Stop'
$helper=Join-Path $PSScriptRoot 'composio_execute.py'
if(-not(Test-Path -LiteralPath $helper -PathType Leaf)){throw 'Composio executor helper is missing.'}
$python=(Get-Command py.exe -ErrorAction SilentlyContinue)
if($null-ne$python){$command=$python.Source;$args=@('-3',$helper,'--packet',$PacketPath,'--phase',$Phase)}
else{$python=Get-Command python.exe -ErrorAction SilentlyContinue;if($null-eq$python){throw 'Python is required for the terminal Composio adapter.'};$command=$python.Source;$args=@($helper,'--packet',$PacketPath,'--phase',$Phase)}
$output=& $command @args 2>&1;$exit=$LASTEXITCODE
if($exit-ne0){throw (($output|ForEach-Object{[string]$_})-join[Environment]::NewLine)}
$text=($output|ForEach-Object{[string]$_})-join[Environment]::NewLine
try{$null=$text|ConvertFrom-Json}catch{throw 'Composio adapter returned invalid JSON.'}
if(-not[string]::IsNullOrWhiteSpace($OutputPath)){
    $directory=Split-Path -Parent $OutputPath;if(-not(Test-Path -LiteralPath $directory)){New-Item -ItemType Directory -Path $directory -Force|Out-Null}
    [IO.File]::WriteAllText([IO.Path]::GetFullPath($OutputPath),$text+[Environment]::NewLine,[Text.UTF8Encoding]::new($false))
}
$text
