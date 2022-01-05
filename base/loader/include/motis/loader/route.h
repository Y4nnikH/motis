#pragma once

#include "motis/core/schedule/bitfield.h"
#include "motis/core/schedule/connection.h"
#include "motis/core/schedule/schedule.h"
#include "motis/core/schedule/time.h"

namespace motis::loader {

struct route_t {
  route_t();

  route_t(mcd::vector<light_connection> const& new_lcons,
          mcd::vector<time> const& times, schedule const& sched);

  bool add_service(mcd::vector<light_connection> const& new_lcons,
                   mcd::vector<time> const& new_times, schedule const& sched,
                   mcd::vector<station*> const& stations);

  void verify_sorted();

  bool empty() const;

  void update_traffic_days(mcd::vector<light_connection> const& new_lcons,
                           schedule const&);

  mcd::vector<light_connection> const& operator[](size_t) const;

  std::vector<mcd::vector<time>> times_;
  std::vector<mcd::vector<light_connection>> lcons_;
  bitfield traffic_days_;
};

}  // namespace motis::loader