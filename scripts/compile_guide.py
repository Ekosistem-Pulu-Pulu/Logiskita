import re
import os
import subprocess

def md_to_html(md_text):
    # Split text into lines
    lines = md_text.split('\n')
    html_lines = []
    
    in_code_block = False
    code_lang = ""
    code_content = []
    
    in_table = False
    table_headers = []
    table_rows = []
    
    in_list = False
    list_type = None # 'ul' or 'ol'
    
    in_blockquote = False
    blockquote_content = []
    
    def flush_list():
        nonlocal in_list, list_type
        if in_list:
            html_lines.append(f"</{list_type}>")
            in_list = False
            list_type = None

    def flush_blockquote():
        nonlocal in_blockquote, blockquote_content
        if in_blockquote:
            text = "\n".join(blockquote_content)
            # Check alert type
            alert_class = "alert-info"
            alert_title = "INFO"
            if "[!IMPORTANT]" in text:
                alert_class = "alert-important"
                alert_title = "⚠️ IMPORTANT"
                text = text.replace("[!IMPORTANT]", "")
            elif "[!WARNING]" in text:
                alert_class = "alert-warning"
                alert_title = "⚠️ WARNING"
                text = text.replace("[!WARNING]", "")
            elif "[!NOTE]" in text:
                alert_class = "alert-note"
                alert_title = "📝 NOTE"
                text = text.replace("[!NOTE]", "")
                
            text_parsed = parse_inline(text.strip())
            html_lines.append(f'<div class="alert {alert_class}"><strong>{alert_title}</strong><p>{text_parsed}</p></div>')
            in_blockquote = False
            blockquote_content = []

    def flush_table():
        nonlocal in_table, table_headers, table_rows
        if in_table:
            html_lines.append("<table>")
            if table_headers:
                html_lines.append("<thead><tr>")
                for cell in table_headers:
                    html_lines.append(f"<th>{parse_inline(cell.strip())}</th>")
                html_lines.append("</tr></thead>")
            html_lines.append("<tbody>")
            for row in table_rows:
                html_lines.append("<tr>")
                for cell in row:
                    html_lines.append(f"<td>{parse_inline(cell.strip())}</td>")
                html_lines.append("</tr>")
            html_lines.append("</tbody></table>")
            in_table = False
            table_headers = []
            table_rows = []

    def parse_inline(text):
        # Escape HTML tags (except ones we generate)
        text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        # Fix back the escaped brackets in anchors if needed, but we do markdown links next:
        # Bold **text**
        text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
        # Inline code `code`
        text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
        # Links [text](url)
        text = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', text)
        return text

    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Handle code blocks
        if line.strip().startswith('```'):
            if in_code_block:
                # End of code block
                code_text = "\n".join(code_content)
                # Simple escape for code block content
                code_text = code_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                html_lines.append(f'<pre><code class="language-{code_lang}">{code_text}</code></pre>')
                in_code_block = False
                code_content = []
            else:
                # Start of code block
                flush_list()
                flush_blockquote()
                flush_table()
                in_code_block = True
                code_lang = line.strip()[3:].strip()
            i += 1
            continue
            
        if in_code_block:
            code_content.append(line)
            i += 1
            continue
            
        # Handle blockquotes (e.g. alerts)
        if line.strip().startswith('>'):
            flush_list()
            flush_table()
            in_blockquote = True
            content = line.strip()[1:].strip()
            blockquote_content.append(content)
            i += 1
            continue
        elif in_blockquote:
            # If next line is not blockquote and not empty, or is empty line, close blockquote
            if not line.strip().startswith('>') and line.strip() != "":
                flush_blockquote()
            elif line.strip() == "":
                flush_blockquote()
                i += 1
                continue
            else:
                content = line.strip()[1:].strip()
                blockquote_content.append(content)
                i += 1
                continue
                
        # Handle tables
        if line.strip().startswith('|'):
            flush_list()
            flush_blockquote()
            # If it's the divider row e.g. | :--- | :--- |
            if '---' in line:
                i += 1
                continue
            cells = [c.strip() for c in line.split('|')[1:-1]]
            if not in_table:
                in_table = True
                table_headers = cells
            else:
                table_rows.append(cells)
            i += 1
            continue
        else:
            flush_table()
            
        # Handle horizontal rules
        if line.strip() in ['---', '***', '___']:
            flush_list()
            flush_blockquote()
            html_lines.append('<hr/>')
            i += 1
            continue
            
        # Handle headers
        header_match = re.match(r'^(#{1,6})\s+(.+)$', line.strip())
        if header_match:
            flush_list()
            flush_blockquote()
            level = len(header_match.group(1))
            title = parse_inline(header_match.group(2))
            # Generate unique id for anchors
            anchor_id = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            html_lines.append(f'<h{level} id="{anchor_id}">{title}</h{level}>')
            i += 1
            continue
            
        # Handle lists
        ul_match = re.match(r'^[\*\-\+]\s+(.+)$', line.strip())
        ol_match = re.match(r'^(\d+)\.\s+(.+)$', line.strip())
        
        if ul_match:
            flush_blockquote()
            item_text = parse_inline(ul_match.group(1))
            if not in_list or list_type != 'ul':
                flush_list()
                in_list = True
                list_type = 'ul'
                html_lines.append("<ul>")
            html_lines.append(f"<li>{item_text}</li>")
            i += 1
            continue
        elif ol_match:
            flush_blockquote()
            item_text = parse_inline(ol_match.group(2))
            if not in_list or list_type != 'ol':
                flush_list()
                in_list = True
                list_type = 'ol'
                html_lines.append("<ol>")
            html_lines.append(f"<li>{item_text}</li>")
            i += 1
            continue
        else:
            flush_list()
            
        # Handle empty lines
        if line.strip() == "":
            i += 1
            continue
            
        # Regular paragraph
        flush_blockquote()
        html_lines.append(f"<p>{parse_inline(line.strip())}</p>")
        i += 1
        
    # Flush remaining
    flush_list()
    flush_blockquote()
    flush_table()
    
    return "\n".join(html_lines)

# Read markdown guide
md_path = r"c:\Users\nural\Downloads\RPL BARU\Panduan_Praktikum_Integrasi.md"
with open(md_path, 'r', encoding='utf-8') as f:
    md_content = f.read()

html_body = md_to_html(md_content)

# Add Google Fonts and beautiful styles
html_template = f"""<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panduan Integrasi API LogistiKita</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {{
            --primary: #4F46E5;
            --primary-light: #EEF2F6;
            --primary-dark: #3730A3;
            --text-main: #1F2937;
            --text-muted: #4B5563;
            --bg-page: #F8FAFC;
            --bg-card: #FFFFFF;
            --border-color: #E2E8F0;
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02);
            --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
            --border-radius: 12px;
        }}

        body {{
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: var(--text-main);
            background-color: var(--bg-page);
            line-height: 1.6;
            margin: 0;
            padding: 40px 20px;
        }}

        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: var(--bg-card);
            padding: 50px 60px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
        }}

        h1 {{
            font-family: 'Outfit', sans-serif;
            font-size: 2.5rem;
            color: #111827;
            margin-top: 0;
            margin-bottom: 20px;
            border-bottom: 3px solid var(--primary);
            padding-bottom: 15px;
            font-weight: 700;
            letter-spacing: -0.02em;
        }}

        h2 {{
            font-family: 'Outfit', sans-serif;
            font-size: 1.8rem;
            color: #1F2937;
            margin-top: 40px;
            margin-bottom: 20px;
            font-weight: 600;
            letter-spacing: -0.01em;
            display: flex;
            align-items: center;
        }}

        h3 {{
            font-family: 'Outfit', sans-serif;
            font-size: 1.3rem;
            color: #374151;
            margin-top: 25px;
            margin-bottom: 12px;
            font-weight: 600;
        }}

        p {{
            margin-bottom: 20px;
            color: var(--text-muted);
            font-size: 1.05rem;
        }}

        a {{
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
            border-bottom: 1px dashed var(--primary);
            transition: all 0.2s ease;
        }}

        a:hover {{
            color: var(--primary-dark);
            border-bottom-style: solid;
        }}

        hr {{
            border: 0;
            height: 1px;
            background: var(--border-color);
            margin: 40px 0;
        }}

        /* Code Blocks */
        pre {{
            background-color: #0F172A;
            border-radius: var(--border-radius);
            padding: 20px;
            overflow-x: auto;
            margin: 20px 0;
            border: 1px solid #1E293B;
            box-shadow: var(--shadow-sm);
        }}

        code {{
            font-family: 'Fira Code', monospace;
            font-size: 0.9rem;
            background-color: #F1F5F9;
            color: #0F172A;
            padding: 3px 6px;
            border-radius: 6px;
            font-weight: 500;
        }}

        pre code {{
            background-color: transparent;
            color: #E2E8F0;
            padding: 0;
            border-radius: 0;
            font-weight: 400;
            line-height: 1.5;
        }}

        /* Lists */
        ul, ol {{
            margin-bottom: 20px;
            padding-left: 25px;
        }}

        li {{
            margin-bottom: 8px;
            color: var(--text-muted);
            font-size: 1.05rem;
        }}

        /* Tables */
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            font-size: 0.95rem;
            text-align: left;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-sm);
        }}

        th {{
            background-color: #F8FAFC;
            color: #1F2937;
            font-weight: 600;
            padding: 12px 16px;
            border-bottom: 2px solid var(--border-color);
        }}

        td {{
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-muted);
            vertical-align: top;
        }}

        tr:last-child td {{
            border-bottom: none;
        }}

        tr:nth-child(even) {{
            background-color: #FCFDFE;
        }}

        /* Alerts */
        .alert {{
            padding: 18px 24px;
            border-radius: var(--border-radius);
            margin: 25px 0;
            border-left: 5px solid;
            font-size: 1rem;
        }}

        .alert p {{
            margin: 0;
            margin-top: 8px;
            color: inherit;
        }}

        .alert-important {{
            background-color: #FFFBEB;
            border-color: #F59E0B;
            color: #92400E;
        }}

        .alert-warning {{
            background-color: #FEF2F2;
            border-color: #EF4444;
            color: #991B1B;
        }}

        .alert-note {{
            background-color: #EFF6FF;
            border-color: #3B82F6;
            color: #1E40AF;
        }}

        .alert-info {{
            background-color: #F0FDF4;
            border-color: #22C55E;
            color: #166534;
        }}
        
        .alert strong {{
            font-family: 'Outfit', sans-serif;
            font-size: 1.05rem;
        }}

        @media (max-width: 768px) {{
            body {{
                padding: 15px 10px;
            }}
            .container {{
                padding: 30px 20px;
            }}
            h1 {{
                font-size: 2rem;
            }}
            table {{
                display: block;
                overflow-x: auto;
            }}
        }}
        
        /* Print styling for PDF */
        @media print {{
            body {{
                background-color: #FFFFFF;
                color: #000000;
                padding: 0;
            }}
            .container {{
                box-shadow: none;
                border: none;
                padding: 0;
                max-width: 100%;
            }}
            pre {{
                border: 1px solid #CCCCCC;
                background-color: #F8F8F8;
            }}
            pre code {{
                color: #000000;
            }}
            thead {{
                display: table-header-group;
            }}
            tr {{
                page-break-inside: avoid;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        {html_body}
    </div>
</body>
</html>
"""

# Write HTML file temporarily
html_path = r"c:\Users\nural\Downloads\RPL BARU\logistikita\Panduan_Praktikum_Integrasi.html"
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_template)

print(f"Generated HTML successfully at {html_path}")

# Run PDF compilation
try:
    temp_html = "C:\\Users\\nural\\AppData\\Local\\Temp\\guide.html"
    temp_pdf = "C:\\Users\\nural\\AppData\\Local\\Temp\\guide.pdf"
    target_pdf = r"c:\Users\nural\Downloads\RPL BARU\Panduan_Praktikum_Integrasi.pdf"
    
    # Copy html to temp directory to avoid space issues
    import shutil
    shutil.copy(html_path, temp_html)
    
    # Run headless Edge to print to PDF
    edge_cmd = [
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        f"--print-to-pdf={temp_pdf}",
        temp_html
    ]
    
    print("Running Edge headless...")
    result = subprocess.run(edge_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    
    if os.path.exists(temp_pdf):
        # Copy pdf back
        shutil.copy(temp_pdf, target_pdf)
        print(f"Generated PDF successfully at {target_pdf}")
        
        # Cleanup temp
        if os.path.exists(temp_html):
            os.remove(temp_html)
        if os.path.exists(temp_pdf):
            os.remove(temp_pdf)
    else:
        print("Failed to generate PDF - PDF file not found in temp.")
        
except Exception as e:
    print(f"Error during PDF compilation: {e}")
