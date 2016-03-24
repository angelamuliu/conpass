class CorrectTypeAndConventionRelationship < ActiveRecord::Migration
  def change
    remove_column :types, :convention_id, :integer
    add_column :conventions, :type_id, :integer
    add_column :types, :description, :text
  end
end
