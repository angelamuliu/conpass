
# A service that provides access to our Geokit gems and etc, used before a location
# has been made so we can allow location previewing

require 'json'
require 'geokit'
# If at some point in future want to return a hash as json ... use to_json

class Geokit_service

    # Given a 1 line string address, attempts to call our Geocoding APIs, and
    # returns the hash result
    def geocode_address(address)
        byebug
        # The multigeocoder will try out all of our geocoding API keys until one works
        geocoded_address = Geokit::Geocoders::MultiGeocoder.geocode(address)
        if (geocoded_address.success)
            return geocoded_address
        else
            return false
        end
    end

end