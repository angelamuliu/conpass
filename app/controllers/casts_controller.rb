class CastsController < ApplicationController
    before_action :set_cast, only: [:destroy]

    def create
        @cast = Cast.new(cast_params)
        respond_to do |format|
            if @cast.save
                @convention = @cast.convention
                format.js {}
            else
                format.js { render :error }
            end
        end
    end

    def destroy
        @cast.destroy
        respond_to do |format|
            @convention = @cast.convention
            format.js {}
        end
    end

    private

    def set_cast
        @cast = Cast.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def cast_params
        params.require(:cast).permit(:upload, :convention_id)
    end

end