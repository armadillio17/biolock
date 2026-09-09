from math import radians, sin, cos, asin, sqrt

EARTH_RADIUS_M = 6371000.0

# A phone reporting poor GPS accuracy near the fence edge would otherwise be
# rejected unfairly, so we forgive up to this many meters -- but no more, or a
# spoofed accuracy value would widen the fence arbitrarily.
MAX_ACCURACY_SLACK_M = 100.0


def distance_meters(lat1, lon1, lat2, lon2):
    """Great-circle distance between two points, in meters."""
    lat1, lon1, lat2, lon2 = (radians(float(v)) for v in (lat1, lon1, lat2, lon2))
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return EARTH_RADIUS_M * 2 * asin(sqrt(a))


def match_location(latitude, longitude, locations, accuracy=0.0):
    """Find the geofence a point falls inside.

    Returns (location, distance) for the first location the point is inside of,
    or (None, distance_to_closest) when the point is outside every one.
    """
    slack = min(max(float(accuracy or 0), 0.0), MAX_ACCURACY_SLACK_M)
    closest = None

    for location in locations:
        distance = distance_meters(latitude, longitude, location.latitude, location.longitude)
        if distance - slack <= float(location.radius):
            return location, distance
        if closest is None or distance < closest[1]:
            closest = (location, distance)

    return None, (closest[1] if closest else None)

# A punch from outside every fence is permitted with a stated reason, but a
# one-character "x" would defeat the point, so require something typed with
# intent. Tune these if staff find the floor annoying in practice.
MIN_OUTSIDE_REASON_LEN = 10
MAX_OUTSIDE_REASON_LEN = 500


def clean_outside_reason(value):
    """Validate the justification for a punch outside every work location.

    Returns (reason, error_detail). error_detail is None when the reason is
    acceptable; reason is None when it is not.
    """
    reason = (value or "").strip()

    if not reason:
        return None, "A reason is required to clock in or out from outside a work location."

    if len(reason) < MIN_OUTSIDE_REASON_LEN:
        return None, (
            f"Please describe why you are outside the work area "
            f"(at least {MIN_OUTSIDE_REASON_LEN} characters)."
        )

    if len(reason) > MAX_OUTSIDE_REASON_LEN:
        return None, f"Please keep the reason under {MAX_OUTSIDE_REASON_LEN} characters."

    return reason, None
