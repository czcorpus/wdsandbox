from aiohttp import web
import collections
import parser

async def handle(request):
    variations = parser.variations
    print(f'Handling request for parameters {request.rel_url.query}')
    for param, value in request.rel_url.query.items():
        variations = list(filter(lambda x: (param, value) in x, variations))
    possible_values = parser.get_possible_values(variations)
    return web.json_response(possible_values)

# run server serving possible word features
# using HTML query you can filter features
app = web.Application()
app.add_routes([web.get('/', handle)])

web.run_app(app, host = 'localhost', port = 8080)