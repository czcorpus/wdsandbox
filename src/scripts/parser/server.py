from aiohttp import web
import collections
import parser

async def handle(request):
    print(f'Handling request for parameters {request.rel_url.query}')
    variations = parser.variations
    filters = collections.defaultdict(list)
    # sort filter values by category
    for param, value in request.rel_url.query.items():
        filters[param].append(value)
    # filter OR logic for values of the same category, AND logic accross categories
    for param, values in filters.items():
        variations = list(filter(any(lambda x: (param, value) in x), variations))
    possible_values = parser.get_possible_values(variations)
    return web.json_response(possible_values)

# run server serving possible word features
# using HTML query you can filter features
app = web.Application()
app.add_routes([web.get('/', handle)])

web.run_app(app, host = 'localhost', port = 8080)