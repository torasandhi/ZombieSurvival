from pathlib import Path

root = Path(__file__).resolve().parent.parent

dist = root / 'dist'
bundle_dir = dist / 'build-assets'
js_files = sorted(bundle_dir.glob('*.js'))
if not js_files:
    raise SystemExit('No bundle files found in dist/build-assets')

bundle_path = js_files[0]
bundle_js = bundle_path.read_text(encoding='utf-8')
html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Zombie Survival</title>
  <style>
    html, body {{
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }}
  </style>
</head>
<body>
  <script type="module">{bundle_js}</script>
</body>
</html>
'''
(dist / 'index.html').write_text(html, encoding='utf-8')
print(f'Wrote {dist / "index.html"} from {bundle_path}')
