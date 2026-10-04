import sys
import re

file_path = r'd:\NSUT-Finance\client\src\pages\Home.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'NeuralNetworkGraph' not in content:
    content = re.sub(r'(import .*?;)', r'\1\nimport NeuralNetworkGraph from "@/components/NeuralNetworkGraph";', content, count=1)

svg_regex = re.compile(r'<svg className="network-svg".*?</svg>', re.DOTALL)
replacement = '<NeuralNetworkGraph nodes={nodes} edges={[{source:"A",target:"C"},{source:"B",target:"C"},{source:"C",target:"D"},{source:"C",target:"E"},{source:"B",target:"F"},{source:"F",target:"E"}]} width="100%" height="470px" particleCount={2500} dustCount={600} />'

new_content, count = svg_regex.subn(replacement, content)

if count > 0:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Successfully replaced SVG with NeuralNetworkGraph')
else:
    print('SVG not found, nothing was replaced.')
