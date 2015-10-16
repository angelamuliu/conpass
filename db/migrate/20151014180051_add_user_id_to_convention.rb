class AddUserIdToConvention < ActiveRecord::Migration
  def change
    add_column :conventions, :user_id, :integer
  end
end
