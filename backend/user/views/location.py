# views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView
from user.models.location import Location
from user.forms.location import LocationForm

# Create
def location_create(request):
    if request.method == 'POST':
        form = LocationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('location_list')
    else:
        form = LocationForm()
    return render(request, 'locations/location_form.html', {'form': form})

# Read (List)
class LocationListView(ListView):
    model = Location
    template_name = 'locations/location_list.html'
    context_object_name = 'locations'

# Read (Detail)
def location_detail(request, pk):
    location = get_object_or_404(Location, pk=pk)
    return render(request, 'locations/location_detail.html', {'location': location})

# Update
def location_update(request, pk):
    location = get_object_or_404(Location, pk=pk)
    if request.method == 'POST':
        form = LocationForm(request.POST, instance=location)
        if form.is_valid():
            form.save()
            return redirect('location_detail', pk=location.pk)
    else:
        form = LocationForm(instance=location)
    return render(request, 'locations/location_form.html', {'form': form})

# Delete
def location_delete(request, pk):
    location = get_object_or_404(Location, pk=pk)
    if request.method == 'POST':
        location.delete()
        return redirect('location_list')
    return render(request, 'locations/location_confirm_delete.html', {'location': location})