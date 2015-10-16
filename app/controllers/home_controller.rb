class HomeController < ApplicationController

    def index
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
