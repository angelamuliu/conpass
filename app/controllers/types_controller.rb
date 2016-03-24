class TypesController < ApplicationController

    def index
        @types = Type.all
    end

    def new
        @type = Type.new
    end

    def edit
    end

    def create
        @type = Type.new(type_params)
        respond_to do |format|
            if @type.save
                format.html { redirect_to @type, notice: 'Type was successfully created.' }
                format.json { render :show, status: :created, location: @type }
            else
                format.html { render :new }
                format.json { render json: @type.errors, status: :unprocessable_entity }
            end
        end
    end

    def update
        respond_to do |format|
            if @type.update(type_params)
                format.html { redirect_to @type, notice: 'Type was successfully updated.'}
                format.json { render :show, status: :ok, location: @type }
            else
                format.html { render :edit }
                format.json { render json: @type.errors, status: :unprocessable_entity }
            end
        end
    end

    def destroy
        @type.destroy
        respond_to do |format|
            format.html { redirect_to types_url, notice: 'Type has been destroyed.' }
            format.json { head :no_content}
        end
    end
    
    private
    # Use callbacks to share common setup or constraints between actions.
    def set_type
        @type = Type.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def type_params
      params.require(:type).permit(:type_id, :name, :default_logo, :default_banner, :remove_default_logo, :remove_default_banner)
    end

end