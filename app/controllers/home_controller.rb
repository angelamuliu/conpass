class HomeController < ApplicationController

    def index
        # request.remote_ip -> GETS IP OF USER
        # PLAN - using IP, locate the user's city via geokit and autopopulate the default
        # "location" field with said information (or fill in hidden field as well!)
    end

    def dashboard
        if logged_in?
            @conventions = current_user.conventions.updated
        end
    end

    def about
    end

    def faq
    end

    def index_sam
    end

end
