class VendorBoothsController < ApplicationController
  before_action :set_vendor_booth, only: [:show, :edit, :update, :destroy]

  # GET /vendor_booths
  # GET /vendor_booths.json
  def index
    @vendor_booths = VendorBooth.all
  end

  # GET /vendor_booths/1
  # GET /vendor_booths/1.json
  def show
  end

  # GET /vendor_booths/new
  def new
    @vendor_booth = VendorBooth.new
  end

  # GET /vendor_booths/1/edit
  def edit
  end

  # POST /vendor_booths
  # POST /vendor_booths.json
  def create
    @vendor_booth = VendorBooth.new(vendor_booth_params)

    respond_to do |format|
      if @vendor_booth.save
        format.html { redirect_to @vendor_booth, notice: 'Vendor booth was successfully created.' }
        format.json { render :show, status: :created, location: @vendor_booth }
      else
        format.html { render :new }
        format.json { render json: @vendor_booth.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /vendor_booths/1
  # PATCH/PUT /vendor_booths/1.json
  def update
    respond_to do |format|
      if @vendor_booth.update(vendor_booth_params)
        format.html { redirect_to @vendor_booth, notice: 'Vendor booth was successfully updated.' }
        format.json { render :show, status: :ok, location: @vendor_booth }
      else
        format.html { render :edit }
        format.json { render json: @vendor_booth.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /vendor_booths/1
  # DELETE /vendor_booths/1.json
  def destroy
    @vendor_booth.destroy
    respond_to do |format|
      format.html { redirect_to vendor_booths_url, notice: 'Vendor booth was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_vendor_booth
      @vendor_booth = VendorBooth.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def vendor_booth_params
      params.require(:vendor_booth).permit(:vendor_id, :booth_id, :start_time, :end_time)
    end
end
