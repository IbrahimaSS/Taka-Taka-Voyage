$c = Get-Content 'src/components/admin/sections/Payments.jsx'
$b = 0
$pb = 0
$ln = 1
foreach ($line in $c) {
    $o = ([regex]::Matches($line, '\{')).Count
    $cl = ([regex]::Matches($line, '\}')).Count
    $po = ([regex]::Matches($line, '\(')).Count
    $pcl = ([regex]::Matches($line, '\)')).Count
    $b = $b + $o - $cl
    $pb = $pb + $po - $pcl
    if ($b -lt 0 -or $pb -lt 0) {
        Write-Host "NEGATIVE balance at line $ln : Braces=$b, Parens=$pb | $line"
    }
    $ln++
}
Write-Host "Final balance: Braces=$b, Parens=$pb"
