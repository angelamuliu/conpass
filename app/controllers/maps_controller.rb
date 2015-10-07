class MapsController < ApplicationController
  before_action :set_map, only: [:show, :edit, :update, :destroy]

  # GET /maps
  # GET /maps.json
  def index
    @maps = Map.all
  end

  # GET /maps/1
  # GET /maps/1.json
  def show
  end

  # GET /maps/new
  def new
    @map = Map.new
  end

  # GET /maps/1/edit
  def edit
  end

  # POST /maps
  # POST /maps.json
  def create
    @map = Map.new(map_params)

    respond_to do |format|
      if @map.save
        format.html { redirect_to @map, notice: 'Map was successfully created.' }
        format.json { render :show, status: :created, location: @map }
      else
        format.html { render :new }
        format.json { render json: @map.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /maps/1
  # PATCH/PUT /maps/1.json
  def update
    respond_to do |format|
      if @map.update(map_params)
        format.html { redirect_to @map, notice: 'Map was successfully updated.' }
        format.json { render :show, status: :ok, location: @map }
      else
        format.html { render :edit }
        format.json { render json: @map.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /maps/1
  # DELETE /maps/1.json
  def destroy
    @map.destroy
    respond_to do |format|
      format.html { redirect_to maps_url, notice: 'Map was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  # -----------------------------------------------------------
  # Main drag and drop screen for map creation

  def craft
    @map = Map.find(params[:id])
    @vendors = @map.convention.vendors
    @tags = @map.convention.tags
    @booths = @map.booths
    # @vendorTags =
    @vendorBooths = @map.vendor_booths

    # Pass these variables into the JS as well
    gon.map = @map
    gon.vendors = @vendors
    gon.tags = @tags
    # gon.vendorTags = @vendorTags
    gon.booths = @booths
    gon.vendorBooths = @vendorBooths
  end

  # Saving map after making changes
  def save
    @map = Map.find(params[:id])
    @map.saveFromHistory(params[:actionHistory])
    redirect_to craft_map_path(@map)
  end

  # -----------------------------------------------------------

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_map
      @map = Map.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def map_params
      params.require(:map).permit(:convention_id, :name, :start_date, :end_date, :actionHistory)
    end
end
