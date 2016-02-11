# http://underthehood.carwow.co.uk/httpsssl-in-your-local-rails-4-1-development-environment/
# Run with SSL via "SSL=true rails s"

if ENV['SSL'] == 'true'  
  require 'rubygems'
  require 'rails/commands/server'
  require 'rack'
  require 'webrick'
  require 'webrick/https'

  module Rails
    class Server < ::Rack::Server
      def default_options 
        super.merge({ SSLEnable: true,
                      SSLVerifyClient: OpenSSL::SSL::VERIFY_NONE,
                      SSLPrivateKey: OpenSSL::PKey::RSA.new(File.open("/Users/Angela/Programming/SSL_certificates/localhost.key").read),
                      SSLCertificate: OpenSSL::X509::Certificate.new(File.open("/Users/Angela/Programming/SSL_certificates/localhost.crt").read),
                      SSLCertName: [["CN", WEBrick::Utils::getservername]],
        })
      end
    end
  end
end