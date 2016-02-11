class HomeController < ApplicationController

    def index
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
