require 'test_helper'

class ConventionsControllerTest < ActionController::TestCase
  setup do
    @convention = conventions(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:conventions)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create convention" do
    assert_difference('Convention.count') do
      post :create, convention: { end_date: @convention.end_date, name: @convention.name, start_date: @convention.start_date }
    end

    assert_redirected_to convention_path(assigns(:convention))
  end

  test "should show convention" do
    get :show, id: @convention
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @convention
    assert_response :success
  end

  test "should update convention" do
    patch :update, id: @convention, convention: { end_date: @convention.end_date, name: @convention.name, start_date: @convention.start_date }
    assert_redirected_to convention_path(assigns(:convention))
  end

  test "should destroy convention" do
    assert_difference('Convention.count', -1) do
      delete :destroy, id: @convention
    end

    assert_redirected_to conventions_path
  end
end
