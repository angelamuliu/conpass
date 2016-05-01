class UsersController < ApplicationController

  # before_filter :check_login

  def new
    @user = User.new
  end
  
  def edit
    @user = User.find(params[:id])
  end
  
  
  def create

    # TODO: When figure out global variable setting, recomment
    # Would like to have a global to control if registrations open or close

    # @user = User.new(user_params)
    # if @user.save
    #     Convention.makeDefault(@user)
    #     redirect_to home_path, notice: 'User #{@user.username} was successfully created.'
    #     session[:user_id] = @user.id
    # else
    #   flash[:error] = "This user could not be created."
    #   render action: "new"
    # end

  end
  
  
  def update
    @user = User.find(params[:id])
    if @user.update_attributes(params[:user])
      redirect_to @user, notice: 'User #{@user.username} was successfully updated.'
    else
      render action: "edit" 
    end
  end
  
  def destroy
    @user = User.find(params[:id])
    @user.destroy
    redirect_to home_path
  end

  private

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation)
  end

end