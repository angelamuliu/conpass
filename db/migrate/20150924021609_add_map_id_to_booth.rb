class AddMapIdToBooth < ActiveRecord::Migration
  def change
    add_column :booths, :map_id, :integer
  end
end
