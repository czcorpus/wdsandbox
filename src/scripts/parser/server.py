from aiohttp import web
import aiohttp_cors
import collections
import parser
import sys


class Handler:

    def __init__(self, variations):
        self._variations = variations

    async def __call__(self, request):
        print(f'Handling request for parameters {request.rel_url.query}')
        variations = self._variations
        for param, value in request.rel_url.query.items():
            variations = list(filter(lambda x: (param, value) in x, self._variations))
        possible_values = parser.get_possible_values(variations)
        return web.json_response(possible_values)

if __name__ == '__main__':
    # run server serving possible word features
    # using HTML query you can filter features
    src_path = sys.argv[1] if len(sys.argv) > 1 else 'vertikala_pdt'
    print(f'Loading resource from {src_path}...')
    variations = parser.load_variations(src_path)
    num_items = len(variations)
    print(f'...done ({num_items} items)')
    app = web.Application()
    cors = aiohttp_cors.setup(app)
    resource = cors.add(app.router.add_resource('/'))
    route = cors.add(
            resource.add_route('GET', Handler(variations)),
            {
                "*": aiohttp_cors.ResourceOptions()
            })
    web.run_app(app, host = 'localhost', port = 8080)
