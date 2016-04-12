class CreateImages < ActiveRecord::Migration
  def change
    create_table :images do |t|
      t.string :image
      t.integer :map_id
      t.integer :layer
      t.integer :x_pos
      t.integer :y_pos

      t.timestamps
    end
  end
end
