require 'celluloid/support/example_actor_class'
require 'celluloid/support/actor_examples'
require 'celluloid/support/mailbox_examples'

module Celluloid
  # Timer accuracy enforced by the tests (50ms)
  TIMER_QUANTUM = 0.05
end

$CELLULOID_DEBUG = true

require 'celluloid/test'
