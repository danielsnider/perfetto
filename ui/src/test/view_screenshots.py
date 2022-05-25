# Usage:
# python3 ui/src/test/view_screenshots.py
# then view results here: ui/src/test/view_screenshots.html
#
# REPL:
# ls ui/src/test/* | grep -v html | entr -cr python3 ui/src/test/view_screenshots.py

import os
from IPython import embed
import glob
import jinja2

def files_to_metadata(paths):
  data = []
  for path in paths:
    item = {
      'path': path,
      'name': os.path.basename(path),
    }
    data.append(item)
  return data

def main():
  template_file = '/home/dans/perfetto/ui/src/test/view_sceenshots.jinja'
  output_path = '/home/dans/perfetto/ui/src/test/view_screenshots.html'
  template_loader = jinja2.FileSystemLoader(searchpath='/')
  template_env = jinja2.Environment(loader=template_loader)
  template = template_env.get_template(template_file)

  # actual_folder = '/home/dans/perfetto/test/data/ui-screenshots/traces'
  # expected_folder = '/home/dans/perfetto/out/ui/ui-test-artifacts/traces'

  # actual_list = list(glob.iglob(f'{actual_folder}/*.png', recursive=True))
  # expected_list = list(glob.iglob(f'{expected_folder}/*.png', recursive=True))

  # actual_metadata = files_to_metadata(actual_list)
  # expected_metadata = files_to_metadata(expected_list)


  actual_folder = '/home/dans/perfetto/test/data/ui-screenshots/traces/'
  actual_list = list(glob.iglob(f'{actual_folder}/*.png', recursive=True))
  actual_list = [file for file in actual_list if 'load' not in file]
  actual_metadata = files_to_metadata(actual_list)

  templateVars = { 'title' : 'Screenshots',
                  'description' : '',
                  'actual': actual_metadata
                }

  rendered_template = template.render(templateVars )

  with open(output_path, 'w') as output_file:
    output_file.writelines(rendered_template)


if __name__ == '__main__':
  main()
  print('Finished rendering jinja template for view_screenshots.py')