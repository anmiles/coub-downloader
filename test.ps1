#usage: powershell ./test.ps1 "src/server/lib/downloader › execute › should render coubs"
$spec = $args
if ($spec -is [Object[]]) { $spec = $spec -join " " }
if (!$spec) { $spec = "src" }
$spec = $spec.Replace("  ", " ").Replace(" > ", " ").Replace(" › ", " ").Replace(" $([char]8250) ", " ")
$path = $spec.Split(" ")[0]
$test_file = $path -replace '([^\/]+)$', "tests/`$1"
$test_dir = "$path/*"
$cmd = "jest --config=jest.config.js $test_dir $test_file -t '$spec' --coverage --collectCoverageFrom=$path.ts --collectCoverageFrom=$path/** --watch"
$cmd
sh $cmd
