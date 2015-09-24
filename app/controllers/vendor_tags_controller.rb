class VendorTagsController < ApplicationController
  before_action :set_vendor_tag, only: [:show, :edit, :update, :destroy]

  # GET /vendor_tags
  # GET /vendor_tags.json
  def index
    @vendor_tags = VendorTag.all
  end

  # GET /vendor_tags/1
  # GET /vendor_tags/1.json
  def show
  end

  # GET /vendor_tags/new
  def new
    @vendor_tag = VendorTag.new
  end

  # GET /vendor_tags/1/edit
  def edit
  end

  # POST /vendor_tags
  # POST /vendor_tags.json
  def create
    @vendor_tag = VendorTag.new(vendor_tag_params)

    respond_to do |format|
      if @vendor_tag.save
        format.html { redirect_to @vendor_tag, notice: 'Vendor tag was successfully created.' }
        format.json { render :show, status: :created, location: @vendor_tag }
      else
        format.html { render :new }
        format.json { render json: @vendor_tag.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /vendor_tags/1
  # PATCH/PUT /vendor_tags/1.json
  def update
    respond_to do |format|
      if @vendor_tag.update(vendor_tag_params)
        format.html { redirect_to @vendor_tag, notice: 'Vendor tag was successfully updated.' }
        format.json { render :show, status: :ok, location: @vendor_tag }
      else
        format.html { render :edit }
        format.json { render json: @vendor_tag.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /vendor_tags/1
  # DELETE /vendor_tags/1.json
  def destroy
    @vendor_tag.destroy
    respond_to do |format|
      format.html { redirect_to vendor_tags_url, notice: 'Vendor tag was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_vendor_tag
      @vendor_tag = VendorTag.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def vendor_tag_params
      params.require(:vendor_tag).permit(:vendor_id, :tag_id)
    end
end
