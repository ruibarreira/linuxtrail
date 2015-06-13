# encoding: utf-8
module Mail
  module VERSION
    
    version = {}

    version['major'] = "2"
    version['minor'] = "6"
    version['patch'] = "1"
    version['build'] = nil
    
    MAJOR = version['major']
    MINOR = version['minor']
    PATCH = version['patch']
    BUILD = version['build']

    STRING = [MAJOR, MINOR, PATCH, BUILD].compact.join('.')
    
    def self.version
      STRING
    end
    
  end
end
