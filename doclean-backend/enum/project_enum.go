package project_enum

// enum ProjectShareTypeEnum {
//   NO_SHARE = 0,
//   EVERYONE = 1,
//   SPECIFIC = 2,
// }

const (
	PROJECT_SHARE_TYPE_NO_SHARE int = iota // PROJECT_SHARE_TYPE_NO_SHARE = 0
	PROJECT_SHARE_TYPE_EVERYONE            // PROJECT_SHARE_TYPE_EVERYONE = 1
	PROJECT_SHARE_TYPE_SPECIFIC            // PROJECT_SHARE_TYPE_SPECIFIC = 2
)