require 'test_helper'

class VendorTagsControllerTest < ActionController::TestCase
  setup do
    @vendor_tag = vendor_tags(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:vendor_tags)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create vendor_tag" do
    assert_difference('VendorTag.count') do
      post :create, vendor_tag: { tag_id: @vendor_tag.tag_id, vendor_id: @vendor_tag.vendor_id }
    end

    assert_redirected_to vendor_tag_path(assigns(:vendor_tag))
  end

  test "should show vendor_tag" do
    get :show, id: @vendor_tag
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @vendor_tag
    assert_response :success
  end

  test "should update vendor_tag" do
    patch :update, id: @vendor_tag, vendor_tag: { tag_id: @vendor_tag.tag_id, vendor_id: @vendor_tag.vendor_id }
    assert_redirected_to vendor_tag_path(assigns(:vendor_tag))
  end

  test "should destroy vendor_tag" do
    assert_difference('VendorTag.count', -1) do
      delete :destroy, id: @vendor_tag
    end

    assert_redirected_to vendor_tags_path
  end
end
