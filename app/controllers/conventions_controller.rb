class ConventionsController < ApplicationController
  before_action :set_convention, only: [:show, :edit, :update, :destroy]

  # GET /conventions
  # GET /conventions.json
  def index
    @conventions = Convention.active.chronological
    @alphabetical = Convention.active.alphabetical
    @upcoming = Convention.active.upcoming.ids
    @current = Convention.active.current.ids
  end

  # GET /conventions/1
  # GET /conventions/1.json
  def show
    @maps = @convention.maps.chronological.alphabetical
    @vendors = @convention.vendors.alphabetical
    @tags = @convention.tags.alphabetical
  end

  # GET/conventions/1/quickview
  def quickview
    @convention = Convention.find(params[:id])
    @maps = @convention.maps.chronological.alphabetical
  end

  def toggle_active
    @convention = Convention.find(params[:id])
    @convention.toggleActive()
    redirect_to home_path
  end

  # GET /conventions/new
  def new
    if logged_out?
        redirect_to need_account_path
    end
    @convention = Convention.new
    @convention.location = Location.new
  end

  # GET /conventions/1/edit
  def edit
    if logged_out?
        redirect_to need_account_path
    end
  end

  # POST /conventions
  # POST /conventions.json
  def create
    if logged_out?
        redirect_to need_account_path
    end
    @convention = Convention.new(convention_params)
    @convention.user = current_user

    respond_to do |format|
      convert_dates
      if @convention.save
        format.html { redirect_to new_map_path(convention_id: @convention.id), notice: 'Convention was successfully created.' }
        format.json { render :quickview, status: :created, location: @convention }
      else
        format.html { render :new }
        format.json { render json: @convention.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /conventions/1
  # PATCH/PUT /conventions/1.json
  def update
    if logged_out?
        redirect_to need_account_path
    end

    respond_to do |format|
      convert_dates
      if @convention.update(convention_params)
        format.html { redirect_to @convention, notice: 'Convention was successfully updated.' }
        format.json { render :show, status: :ok, location: @convention }
      else
        format.html { render :edit }
        format.json { render json: @convention.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /conventions/1
  # DELETE /conventions/1.json
  def destroy
    if logged_out?
        redirect_to need_account_path
    end
    @convention.destroy
    respond_to do |format|
      format.html { redirect_to home_url, notice: 'Convention was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def search
    # byebug
    # params["search"]["user_location"]
    # params["search"]["search_distance"]
    # params["search"]["type"]
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_convention
      @convention = Convention.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def convention_params
      params.require(:convention).permit(:name, :start_date, :end_date, :logo, :banner, :remove_logo, :remove_banner, :description,
                                         location_attributes: [:id, :address_1, :address_2, :city, :state, :zip, :latitude, :longitude])
    end

    def convert_dates
        params[:convention][:start_date] = convert_to_date(params[:convention][:start_date]) unless params[:convention][:start_date].blank?
        params[:convention][:end_date] = convert_to_date(params[:convention][:end_date]) unless params[:convention][:end_date].blank?
    end
end


