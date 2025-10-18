from django.http import HttpResponse
from django.views.decorators.http import require_GET

@require_GET
def health_check(request):
    """
    Simple health check endpoint.
    Returns 'ok bro' with a 200 status code.
    """
    return HttpResponse("ok bro\n", status=200)

# Create more views related to the game logic as needed.
