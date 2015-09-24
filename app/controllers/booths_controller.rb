class BoothsController < ApplicationController
  before_action :set_booth, only: [:show, :edit, :update, :destroy]

  # GET /booths
  # GET /booths.json
  def index
    @booths = Booth.all
  end

  # GET /booths/1
  # GET /booths/1.json
  def show
  end

  # GET /booths/new
  def new
    @booth = Booth.new
  end

  # GET /booths/1/edit
  def edit
  end

  # POST /booths
  # POST /booths.json
  def create
    @booth = Booth.new(booth_params)

    respond_to do |format|
      if @booth.save
        format.html { redirect_to @booth, notice: 'Booth was successfully created.' }
        format.json { render :show, status: :created, location: @booth }
      else
        format.html { render :new }
        format.json { render json: @booth.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /booths/1
  # PATCH/PUT /booths/1.json
  def update
    respond_to do |format|
      if @booth.update(booth_params)
        format.html { redirect_to @booth, notice: 'Booth was successfully updated.' }
        format.json { render :show, status: :ok, location: @booth }
      else
        format.html { render :edit }
        format.json { render json: @booth.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /booths/1
  # DELETE /booths/1.json
  def destroy
    @booth.destroy
    respond_to do |format|
      format.html { redirect_to booths_url, notice: 'Booth was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_booth
      @booth = Booth.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def booth_params
      params.require(:booth).permit(:start_time, :end_time, :vendor_id, :x_pos, :y_pos, :width, :height)
    end
end
