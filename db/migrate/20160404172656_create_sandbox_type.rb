class CreateSandboxType < ActiveRecord::Migration

# Creates the type "sandbox," which is never shown to the public
# and is used to allow the user to toy around with stuff

    def up
        sandboxType = Type.new
        sandboxType.name = "Sandbox"
        sandboxType.description = "Want to just experiment with the interface? Create a sandbox convention! It won't ever go public unless you switch the type later, allowing you to freely play around until you're comfortable."
        sandboxType.save
    end

    def down
        sandboxType = Type.find_by_name("Sandbox")
        sandboxType.destroy
    end

end
