class AddNameToBooth < ActiveRecord::Migration
  def change
    add_column :booths, :name, :string
  end
end
