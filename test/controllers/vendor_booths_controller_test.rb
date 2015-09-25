require 'test_helper'

class VendorBoothsControllerTest < ActionController::TestCase
  setup do
    @vendor_booth = vendor_booths(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:vendor_booths)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create vendor_booth" do
    assert_difference('VendorBooth.count') do
      post :create, vendor_booth: { booth_id: @vendor_booth.booth_id, end_time: @vendor_booth.end_time, start_time: @vendor_booth.start_time, vendor_id: @vendor_booth.vendor_id }
    end

    assert_redirected_to vendor_booth_path(assigns(:vendor_booth))
  end

  test "should show vendor_booth" do
    get :show, id: @vendor_booth
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @vendor_booth
    assert_response :success
  end

  test "should update vendor_booth" do
    patch :update, id: @vendor_booth, vendor_booth: { booth_id: @vendor_booth.booth_id, end_time: @vendor_booth.end_time, start_time: @vendor_booth.start_time, vendor_id: @vendor_booth.vendor_id }
    assert_redirected_to vendor_booth_path(assigns(:vendor_booth))
  end

  test "should destroy vendor_booth" do
    assert_difference('VendorBooth.count', -1) do
      delete :destroy, id: @vendor_booth
    end

    assert_redirected_to vendor_booths_path
  end
end
