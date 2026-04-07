# Comprehensive fix - replace ALL mojibake patterns
$filePath = "d:\project web\app.js"
$bytes = [System.IO.File]::ReadAllBytes($filePath)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)

# Build all mojibake patterns and their replacements
# â€" variants -> em-dash
$patterns = @{
    ([char]0x00E2 + [string][char]0x20AC + [string][char]0x201D) = [string][char]0x2014  # — em-dash
    ([char]0x00E2 + [string][char]0x20AC + [string][char]0x201C) = [string][char]0x2014  # — em-dash
    ([char]0x00E2 + [string][char]0x20AC + [string][char]0x0153) = [string][char]0x2014  # — em-dash
    ([char]0x00E2 + [string][char]0x0153 + [string][char]0x201C) = [string][char]0x2713  # ✓ check mark  
    ([char]0x00E2 + [string][char]0x0153 + [string][char]0x008F) = [string][char]0x270F  # ✏ pencil
    ([char]0x00E2 + [string][char]0x0153 + [string][char]0x2026) = [string][char]0x2705  # ✅ 
    ([char]0x00C3 + [string][char]0x00A2 + [string][char]0x0020) = [string][char]0x00E2  # fix double-encoded
}

foreach ($kv in $patterns.GetEnumerator()) {
    $before = ($text.Split($kv.Key)).Length - 1
    if ($before -gt 0) {
        Write-Host "Pattern '$($kv.Key)' -> found $before times, replacing..."
        $text = $text.Replace($kv.Key, $kv.Value)
    }
}

# Check for remaining U+00E2 
$lines = $text.Split("`n")
$issues = 0
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains([char]0x00E2)) {
        $issues++
        $idx = $lines[$i].IndexOf([char]0x00E2)
        $ctx = ""
        for ($j = [Math]::Max(0,$idx-2); $j -lt [Math]::Min($idx+5, $lines[$i].Length); $j++) {
            $code = [int]$lines[$i][$j]
            $ctx += "U+$($code.ToString('X4')) "
        }
        Write-Host "Line $($i+1): remaining issue at $idx`: $ctx"
    }
}
Write-Host "Total lines with remaining issues: $issues"

# Write back
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($filePath, $text, $utf8NoBom)
Write-Host "File saved"
