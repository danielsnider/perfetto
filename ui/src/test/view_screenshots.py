import jinja2

templateLoader = jinja2.FileSystemLoader( searchpath="/" )
templateEnv = jinja2.Environment( loader=templateLoader )

TEMPLATE_FILE = "/home/dans/perfetto/ui/src/test/view_sceenshots.jinja"
template = templateEnv.get_template( TEMPLATE_FILE )

# Here we add a new input variable containing a list.
# Its contents will be expanded in the HTML as a unordered list.
FAVORITES = [ "chocolates", "lunar eclipses", "rabbits" ]

templateVars = { "title" : "Test Example",
                 "description" : "A simple inquiry of function.",
                 "favorites" : FAVORITES
               }

outputText = template.render( templateVars )

print(outputText)