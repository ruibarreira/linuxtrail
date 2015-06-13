require 'rails/engine'

module Coffee
  module Rails
    class Engine < ::Rails::Engine
      config.root = '/usr/share/ruby-coffee-rails'
      config.app_generators.javascript_engine :coffee
    end
  end
end
