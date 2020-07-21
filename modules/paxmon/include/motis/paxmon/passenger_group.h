#pragma once

#include <cstdint>
#include <vector>

#include "motis/core/journey/journey.h"

#include "motis/paxmon/compact_journey.h"

namespace motis::paxmon {

struct edge;

struct data_source {
  std::uint64_t primary_ref_{};
  std::uint64_t secondary_ref_{};
};

struct passenger_group {
  compact_journey compact_planned_journey_;
  std::uint64_t id_{};
  data_source source_{};
  std::uint16_t passengers_{1};
  bool ok_{true};
  float probability_{1.0};
  std::vector<edge*> edges_{};
};

}  // namespace motis::paxmon
