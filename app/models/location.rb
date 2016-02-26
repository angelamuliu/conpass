class Location < ActiveRecord::Base
    acts_as_mappable :lat_column_name => :latitude,
                     :lng_column_name => :longitude

    before_save :locate_ll

    # Relationships
    belongs_to :convention

    # Publically available constant
    STATES_LIST = [['Alabama', 'AL'],['Alaska', 'AK'],['Arizona', 'AZ'],['Arkansas', 'AR'],['California', 'CA'],['Colorado', 'CO'],['Connectict', 'CT'],['Delaware', 'DE'],['District of Columbia ', 'DC'],['Florida', 'FL'],['Georgia', 'GA'],['Hawaii', 'HI'],['Idaho', 'ID'],['Illinois', 'IL'],['Indiana', 'IN'],['Iowa', 'IA'],['Kansas', 'KS'],['Kentucky', 'KY'],['Louisiana', 'LA'],['Maine', 'ME'],['Maryland', 'MD'],['Massachusetts', 'MA'],['Michigan', 'MI'],['Minnesota', 'MN'],['Mississippi', 'MS'],['Missouri', 'MO'],['Montana', 'MT'],['Nebraska', 'NE'],['Nevada', 'NV'],['New Hampshire', 'NH'],['New Jersey', 'NJ'],['New Mexico', 'NM'],['New York', 'NY'],['North Carolina','NC'],['North Dakota', 'ND'],['Ohio', 'OH'],['Oklahoma', 'OK'],['Oregon', 'OR'],['Pennsylvania', 'PA'],['Rhode Island', 'RI'],['South Carolina', 'SC'],['South Dakota', 'SD'],['Tennessee', 'TN'],['Texas', 'TX'],['Utah', 'UT'],['Vermont', 'VT'],['Virginia', 'VA'],['Washington', 'WA'],['West Virginia', 'WV'],['Wisconsin ', 'WI'],['Wyoming', 'WY']]

    # Takes whatever fields it has and returns as one line for geolocating purposes
    def one_line_address
        return (address_1.blank? ? "" : address_1) + " " + (address_2.blank? ? "" : address_2) + " " + (city.blank? ? "" : city) + " " + (state.blank? ? "" : state) + " " + (zip.blank? ? "" : zip) + " " + (country.blank? ? "" : country)
    end


    # First checks if there's enough address information. Then attempts to
    # find the longitude and latitude and sets it
    def locate_ll
        geocoded_address = Geokit_service.new().geocode_address(one_line_address)
        if (geocoded_address.success)
            self.latitude = geocoded_address.lat
            self.longitude = geocoded_address.lng
        else 
            # The user input some new address that google can't find ... so we don't want to show the old google location
            self.latitude =  nil
            self.longitude = nil
        end
    end



  #   ## TODO: EDIT bc i just stole this
  # def create_map_link(zoom=12,width=500,height=500)
  #   markers = ""; i = 1
  #   self.attractions.alphabetical.to_a.each do |attr|
  #     markers += "&markers=color:red%7Ccolor:red%7Clabel:#{i}%7C#{attr.latitude},#{attr.longitude}"
  #     i += 1
  #   end
  #   map = "http://maps.google.com/maps/api/staticmap?center=#{latitude},#{longitude}&zoom=#{zoom}&size=#{width}x#{height}&maptype=roadmap#{markers}&sensor=false"
  # end





    # # Returns true if the location has enough information to return a longitude, latitude
    # def valid
    # end

    # # Takes whatever available information there is and spits out a address as a 1 line string
    # def full_address
    # end

    # # Using the geokit-rails gem, takes the full string address and attempts to convert into longitude
    # # and latitude. Returns 
    # def address_to_ll
    # end

end
