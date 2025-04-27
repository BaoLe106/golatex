package files

import (
	"sort"
	"strconv"
	"strings"

	// "time"

	"github.com/BaoLe106/doclean/doclean-backend/db"
	"github.com/google/uuid"
	// "github.com/BaoLe106/doclean/doclean-backend/redis"
)

// GetTreeData converts a flat list of file paths into a hierarchical tree structure
func GetTreeData(input []InputItem) []Node {
	rootNode := struct {
		Directories []Node
		Files       []Node
	}{
		Directories: []Node{},
		Files:       []Node{},
	}

	// First, sort the input to ensure consistent output
	sort.Slice(input, func(i, j int) bool {
		a, b := input[i], input[j]

		// Extract the parent directories (the first-level folder names)
		var aParentDir, bParentDir string
		aParts := strings.Split(a.FileDir, "/")
		bParts := strings.Split(b.FileDir, "/")
		
		if len(aParts) > 1 {
			aParentDir = aParts[1]
		}
		if len(bParts) > 1 {
			bParentDir = bParts[1]
		}

		// Prioritize parent directories in alphabetical order
		if aParentDir != bParentDir {
			return aParentDir < bParentDir
		}

		// Identify if a or b is a directory (no ".")
		aIsDir := false
		bIsDir := false
		
		if len(aParts) > 0 {
			aIsDir = !strings.Contains(aParts[len(aParts)-1], ".")
		}
		if len(bParts) > 0 {
			bIsDir = !strings.Contains(bParts[len(bParts)-1], ".")
		}

		// Prioritize directories over files
		if aIsDir != bIsDir {
			return aIsDir
		}

		// Sort alphabetically within same parent directory
		return a.FileDir < b.FileDir
	})

	// Process each file path
	for _, item := range input {
		// Remove the leading slash and split by remaining slashes
		filePath := item.FileDir
		// if strings.HasPrefix(filePath, "/") {
		// 	filePath = filePath[1:]
		// }
		filePath = strings.TrimPrefix(filePath, "/")
		pathParts := strings.Split(filePath, "/")
		
		// Check if this is an empty folder
		// An empty folder is either explicitly marked with a trailing slash or
		// it's a path without file extension and not equal to a root file
		isFolder := false
		if len(pathParts) > 0 {
			isFolder = !strings.Contains(pathParts[len(pathParts)-1], ".")
		}

		// Handle items in the root directory
		if len(pathParts) == 1 {
			if pathParts[0] == "" {
				continue // Skip if it's just "/"
			}

			if isFolder {
				// It's a folder in the root
				rootNode.Directories = append(rootNode.Directories, Node{
					FileID: 	item.FileID,
					Title: 		pathParts[0],
					Key:    	"placeholder", // Temporary key, will be fixed later
					IsLeaf: 	false,
				})
			} else {
				// It's a file in the root
				rootNode.Files = append(rootNode.Files, Node{
					FileID: 	item.FileID,
					Title: 		pathParts[0],
					Content: 	item.FileContent,
					Key:    	"placeholder", // Temporary key, will be fixed later
					IsLeaf: 	true,
				})
			}
			continue
		}

		// For nested paths, build the tree structure
		currentLevel := &rootNode.Directories
		// currentPath := []string{}
		currentKey := "0"

		// Determine how many parts to process
		partsToProcess := len(pathParts)
		if !isFolder {
			partsToProcess = len(pathParts) - 1
		}

		// Process all directories in the path
		for i := 0; i < partsToProcess; i++ {
			folderName := pathParts[i]
			if folderName == "" {
				continue // Skip empty parts
			}

			// currentPath = append(currentPath, folderName)
			// Find if this directory already exists in the current level
			folderIndex := -1
			for idx, node := range *currentLevel {
				if node.Title == folderName {
					folderIndex = idx
					break
				}
			}

			// If not, create the directory node
			if folderIndex == -1 {
				// Get the index where this folder should be inserted
				folderIndex = len(*currentLevel)
				// newKey := fmt.Sprintf()
				newKey := currentKey + "-" + strconv.Itoa(folderIndex)
				folderNode := Node{
					FileID: 	item.FileID,
					Title:		folderName,
					Key:      newKey,
					Children: []Node{},
				}
				*currentLevel = append(*currentLevel, folderNode)
				folderIndex = len(*currentLevel) - 1
			}

			// Update the current key for the next level
			currentKey = (*currentLevel)[folderIndex].Key
			// Move down to the next level
			currentLevel = &(*currentLevel)[folderIndex].Children
		}

		// If it's a file (not a folder), add the file as a leaf node
		if !isFolder {
			fileName := pathParts[len(pathParts)-1]
			*currentLevel = append(*currentLevel, Node{
				FileID: 	item.FileID,
				Title:    fileName,
				Content: 	item.FileContent,
				Key:    	currentKey + "-" +  strconv.Itoa(len(*currentLevel)),
				IsLeaf: 	true,
			})
		}
	}

	// Combine directories and files, with directories first
	result := append([]Node{}, rootNode.Directories...)
	result = append(result, rootNode.Files...)

	// Fix keys recursively
	fixKeys(result, "0")

	return result
}

// fixKeys recursively ensures all nodes have proper keys
func fixKeys(nodes []Node, parentKey string) {
	for i := range nodes {
		nodes[i].Key = parentKey + "-" +  strconv.Itoa(i)

		// If the node has a children array, process it
		if len(nodes[i].Children) > 0 {
			// Process child nodes
			fixKeys(nodes[i].Children, nodes[i].Key)
			nodes[i].IsLeaf = false
		} else if nodes[i].Children != nil {
			// Empty folder - remove empty children array but keep isLeaf as false
			nodes[i].Children = nil
			nodes[i].IsLeaf = false
		}

		// If isLeaf is not set and there's no children property, it's a directory
		if !nodes[i].IsLeaf && nodes[i].Children == nil {
			nodes[i].IsLeaf = false
		}

		if nodes[i].IsLeaf && nodes[i].Children == nil && !strings.Contains(nodes[i].Title, ".") {
			nodes[i].IsLeaf = false
		}
	}
}


func GetFilesByProjectId(projectId string) (*GetFilesByProjectIdSchema, error){
	result, err := db.DB.Query(`
		SELECT 
			file_id, 
			file_name, 
			file_type, 
			file_dir,
			content, 
			last_updated_by, 
			last_updated_at
		FROM file_info 
		WHERE project_id = $1
		ORDER BY file_dir ASC
	`,
		projectId,
	)

	if err != nil {
    return nil, err
  }

	defer result.Close()

	files := []FileSchema{}
	inputs := []InputItem{}
	for result.Next() {
		var file FileSchema
		var input InputItem
		if err := result.Scan(
			&file.FileID,
			&file.FileName,
			&file.FileType,
			&file.FileDir,
			&file.Content,
			&file.LastUpdatedBy,
			&file.LastUpdatedAt,
		); err != nil {
			return nil, err
		}
		var fileDir string = file.FileDir[41:]

		input.FileID = file.FileID
		if (file.FileType != "folder") {
			fileDir += "/"
			input.FileDir = fileDir + file.FileName + "." + file.FileType
			input.FileContent = &file.Content
		} else {
			input.FileDir = fileDir
		}
		
		inputs = append(inputs, input)
		files = append(files, file)
	}

	fileTree := GetTreeData(inputs)

	return &GetFilesByProjectIdSchema{
		Files: files,
		FileTree: fileTree,
	}, nil
}

func GetFileByFileId(fileId uuid.UUID) (*FileSchema, error) {
	var file FileSchema
	err := db.DB.QueryRow(`
		SELECT 
			file_id, 
			file_name, 
			file_type, 
			file_dir,
			content, 
			last_updated_by, 
			last_updated_at
		FROM file_info 
		WHERE file_id = $1
	`, fileId).Scan(
		&file.FileID,
		&file.FileName,
		&file.FileType,
		&file.FileDir,
		&file.Content,
		&file.LastUpdatedBy,
		&file.LastUpdatedAt,
	)

	if err != nil {
    return nil, err
	}

	return &file, nil
}

func CreateFile(input CreateFilePayload) error{
	_, err := db.DB.Exec(`
		INSERT INTO file_info (
			file_id,
			project_id,
			file_name,
			file_type,
			file_dir,
			content,
			created_by,
			created_at,
			last_updated_by,
			last_updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, NOW())
	`, 
		input.FileID, 
		input.ProjectID, 
		input.FileName, 
		input.FileType,
		input.FileDir,
		input.Content, 
		input.CreatedBy, 
		input.LastUpdatedBy,
	)

	return err
}

func SaveFileContent(input SaveFileContentPayload) error{
	_, err := db.DB.Exec(`
		UPDATE file_info 
		SET content = $1, last_updated_at = NOW()
		WHERE 
			file_id = $2
			AND project_id = $3
	`, 
		input.Content, 
		input.FileID, 
		input.ProjectID, 
	)

	return err
}